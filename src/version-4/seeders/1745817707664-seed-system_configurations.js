'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM system_configurations`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) {
      await queryInterface.bulkInsert('system_configurations', [
        {
          "id": 1,
          "config_key": "VIEW_ACCESS_ID_ACTION",
          "config_value": "6",
          "user_friendly_name": "Action Id for View Access",
          "display_sequence": null,
          "config_group": null,
          "id_metal": null,
          "formula": null,
          "company_info_id": 1
        }
      ])
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('system_configurations', null, {});
  }
};
