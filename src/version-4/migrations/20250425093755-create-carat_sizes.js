
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carat_sizes', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
     is_active: {
      allowNull: false,
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
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      sort_code: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      value: {
  allowNull: true,
  type: 'character varying',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_config: {
  allowNull: true,
  type: 'bit(1)',
},
      is_diamond_shape: {
  allowNull: true,
  type: 'character varying',
},
      is_band: {
  allowNull: true,
  type: 'bit(1)',
  default:'0',
},
      is_three_stone: {
  allowNull: true,
  type: 'bit(1)',
  default:'0',
},
      is_bracelet: {
  allowNull: true,
  type: 'bit(1)',
  default:'0',
},
      is_pendant: {
  allowNull: true,
  type: 'bit(1)',
  default:'0',
},
      is_earring: {
  allowNull: true,
  type: 'bit(1)',
  default:'0',
},
      is_diamond: {
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
    await queryInterface.dropTable('carat_sizes');
  }
};
