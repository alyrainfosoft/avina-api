
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      user_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      house_building: {
  allowNull: false,
  type: 'character varying',
},
      area_name: {
  allowNull: true,
  type: 'character varying',
},
      pincode: {
  allowNull: false,
  type: 'character varying',
},
      city_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      state_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      country_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      address_type: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      phone: {
  allowNull: false,
  type: Sequelize.BIGINT,
},
      default_addres: {
  allowNull: false,
  allowNull: false,
  type: 'bit(1)',
},
      is_deleted: {
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
      full_name: {
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
    await queryInterface.dropTable('addresses');
  }
};
