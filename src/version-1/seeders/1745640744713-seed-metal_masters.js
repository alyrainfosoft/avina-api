'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM metal_masters`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) {
      await queryInterface.bulkInsert('metal_masters', [
        {
          "id": 1,
          "name": "Gold",
          "slug": "gold",
          "created_by": 1,
          "created_date": new Date(),
          "modified_date": null,
          "modified_by": null,
          "is_active": "1",
          "is_deleted": "0",
          "metal_rate": 8875,
          "is_config": "1",
          "is_band": "1",
          "is_three_stone": "1",
          "is_bracelet": "1",
          "is_pendant": "0",
          "is_earring": "0",
          "calculate_rate": 1,
          "company_info_id": 1
        },
        {
          "id": 2,
          "name": "Silver",
          "slug": "silver",
          "created_by": 1,
          "created_date": new Date(),
          "modified_date": null,
          "modified_by": null,
          "is_active": "1",
          "is_deleted": "0",
          "metal_rate": 100,
          "is_config": "1",
          "is_band": "1",
          "is_three_stone": "1",
          "is_bracelet": "1",
          "is_pendant": "0",
          "is_earring": "0",
          "calculate_rate": 1,
          "company_info_id": 1
        },
        {
          "id": 3,
          "name": "Platinum",
          "slug": "platinum",
          "created_by": 1,
          "created_date": new Date(),
          "modified_date": null,
          "modified_by": null,
          "is_active": "1",
          "is_deleted": "0",
          "metal_rate": 100,
          "is_config": "1",
          "is_band": "1",
          "is_three_stone": "1",
          "is_bracelet": "1",
          "is_pendant": "0",
          "is_earring": "0",
          "calculate_rate": 1,
          "company_info_id": 1
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('metal_masters', null, {});
  }
};
