
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_configurations', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      config_key: {
  allowNull: false,
  type: 'character varying(50)',
},
      config_value: {
  allowNull: false,
  type: 'character varying(100)',
},
      user_friendly_name: {
  allowNull: true,
  type: 'character varying(75)',
},
      display_sequence: {
  allowNull: true,
  type: Sequelize.SMALLINT,
},
      config_group: {
  allowNull: true,
  type: Sequelize.SMALLINT,
},
      id_metal: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      formula: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('system_configurations');
  }
};
