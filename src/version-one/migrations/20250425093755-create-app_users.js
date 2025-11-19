
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('app_users', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      username: {
  allowNull: false,
  type: 'character varying(75)',
},
      pass_hash: {
  allowNull: true,
  type: 'character varying(200)',
},
      user_type: {
  allowNull: true,
  type: Sequelize.SMALLINT,
},
      user_status: {
  allowNull: false,
  default:0,
  type: Sequelize.SMALLINT,
},
      refresh_token: {
  allowNull: true,
  type: 'character varying(250)',
},
      pass_reset_token: {
  allowNull: true,
  type: 'character varying(250)',
},
      one_time_pass: {
  allowNull: true,
  type: 'character varying',
},
      resend_otp_count: {
  allowNull: true,
  type: Sequelize.SMALLINT,
},
      last_login_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      firebase_device_token: {
  allowNull: true,
  type: 'character varying(300)',
},
     is_active: {
  default:'0',
  type: 'bit(1)',
},
      is_email_verified: {
  allowNull: false,
  default:'0',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      approved_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      approved_date: {
  allowNull: true,
  type: Sequelize.DATE,
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
      id_role: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      otp_create_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      otp_expire_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_super_admin: {
  allowNull: false,
  default:false,
  type: Sequelize.BOOLEAN,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('app_users');
  }
};
