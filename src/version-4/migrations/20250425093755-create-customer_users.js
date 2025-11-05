
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
     // Create an ENUM type
     await queryInterface.sequelize.query(`
CREATE TYPE public.sign_up_type AS ENUM
    ('system', 'google', 'instagram', 'facebook', 'apple');    `);
     // Create an ENUM type
     await queryInterface.sequelize.query(`
CREATE TYPE public.customer_gender AS ENUM
    ('male', 'female', 'other');    `);
    await queryInterface.createTable('customer_users', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      full_name: {
  allowNull: false,
  type: 'character varying',
},
      email: {
  allowNull: true,
  type: 'character varying',
},
      mobile: {
  allowNull: true,
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
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_app_user: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      country_id: {
  allowNull: true,
  type: 'character varying',
},
      third_party_response: {
  allowNull: true,
  type: Sequelize.JSON,
},
      sign_up_type: {
  allowNull: true,
  default:'system',
  type: 'sign_up_type',
},
      gender: {
  allowNull: true,
  type: 'customer_gender',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('customer_users');

     // Drop the ENUM type
     await queryInterface.sequelize.query(`
      DROP TYPE   type: 'sign_up_type',
;
    `); // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE customer_gender;
    `);
  }
};
