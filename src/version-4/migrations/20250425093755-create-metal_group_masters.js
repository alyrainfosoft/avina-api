
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('metal_group_masters', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      id_metal: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      id_kt: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_by: {
  allowNull: false,
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
     is_active: {
  type: 'bit(1)',
},
      is_deleted: {
  type: 'bit(1)',
},
      name: {
  allowNull: false,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('metal_group_masters');
  }
};
