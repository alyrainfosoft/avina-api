
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diamond_group_masters', {
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
      id_stone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_shape: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_mm_size: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_color: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_clarity: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      rate: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
     is_active: {
      allowNull: false,
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
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      id_cuts: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_carat: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_seive_size: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      synthetic_rate: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      is_config: {
 default:'0',
  type: 'bit(1)',
},
      min_carat_range: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      max_carat_range: {
  allowNull: true,
  type: Sequelize.DOUBLE,
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
      is_diamond_type: {
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
    await queryInterface.dropTable('diamond_group_masters');
  }
};
