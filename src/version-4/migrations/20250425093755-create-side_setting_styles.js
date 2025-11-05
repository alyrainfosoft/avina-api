
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('side_setting_styles', {
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
      slug: {
  allowNull: false,
  type: 'character varying',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {allowNull: true,
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
      is_deleted: {allowNull: true,
  type: 'bit(1)',
},
      sort_code: {
  allowNull: false,
  type: 'character varying',
},
      id_shank: {
  allowNull: true,
  type: 'character varying',
},
      is_config: {
  default:'0',
  type: 'bit(1)',
},
      is_band: {
  default:'0',
  type: 'bit(1)',
},
      is_three_stone: {
  default:'0',
  type: 'bit(1)',
},
      is_bracelet: {
  default:'0',
  type: 'bit(1)',
},
      is_pendant: {
  default:'0',
  type: 'bit(1)',
},
      is_earring: {
  default:'0',
  type: 'bit(1)',
},
      sort_order: {
  allowNull: true,
  type: Sequelize.JSON,
},
      diamond_shape_id: {
  allowNull: true,
  type: Sequelize.JSON,
},
      diamond_size_id: {
  allowNull: true,
  type: Sequelize.JSON,
},
      config_image: {
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
    await queryInterface.dropTable('side_setting_styles');
  }
};
