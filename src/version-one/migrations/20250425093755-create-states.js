
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('states', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      state_name: {
  allowNull: false,
  type: 'character varying',
},
      state_code: {
  allowNull: false,
  type: 'character varying',
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
     is_active: {allowNull: true,
  type: 'bit(1)',
},
      is_deleted: {allowNull: true,
  type: 'bit(1)',
},
      id_country: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('states');
  }
};
