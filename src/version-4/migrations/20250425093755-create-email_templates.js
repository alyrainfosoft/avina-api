
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_templates', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      template_name: {
  allowNull: false,
  type: 'character varying',
},
      subject: {
  allowNull: false,
  type: 'character varying',
},
      body: {
  allowNull: false,
  type: Sequelize.TEXT,
},
      placeholders: {
  allowNull: false,
  type: Sequelize.JSONB,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_active: {
  allowNull: true,
  type: 'bit(1)',
},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)',
},
      message_type: {
  allowNull: true,
  type: Sequelize.ARRAY(Sequelize.INTEGER),
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('email_templates');
  }
};
