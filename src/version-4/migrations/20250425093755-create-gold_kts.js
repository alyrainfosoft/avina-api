
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gold_kts', {
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
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
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
      id_metal: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      is_config: {
  allowNull: false,
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
      calculate_rate: {
  allowNull: false,
  default:1,
  type: Sequelize.DOUBLE,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('gold_kts');
  }
};
