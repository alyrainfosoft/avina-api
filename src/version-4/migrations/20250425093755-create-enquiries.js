
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enquiries', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      first_name: {
  allowNull: false,
  type: 'character varying',
},
      email: {
  allowNull: false,
  type: 'character varying',
},
      phone_number: {
  allowNull: true,
  type: 'character varying',
},
      message: {
  allowNull: true,
  type: 'character varying',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      enquirie_type: {
  allowNull: false,
  type: 'bit(1)',
},
      date: {
  allowNull: true,
  type: Sequelize.DATEONLY,
},
      time: {
  allowNull: true,
  type: Sequelize.TIME,
},
      last_name: {
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
    await queryInterface.dropTable('enquiries');
  }
};
