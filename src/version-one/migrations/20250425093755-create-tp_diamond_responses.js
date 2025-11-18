
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tp_diamond_responses', {
      tp_name: {
  allowNull: false,
  type: 'character varying(50)',
},
      response: {
  allowNull: false,
  type: Sequelize.JSON,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tp_diamond_responses');
  }
};
