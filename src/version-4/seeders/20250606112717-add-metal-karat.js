'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   const value = await queryInterface.sequelize.query(`SELECT * FROM gold_kts`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('gold_kts', [
  {
    "id": 5,
    "name": 22,
    "slug": "22K",
    "is_band": "0",
    "id_image": null,
    "id_metal": 1,
    "is_active": "1",
    "is_config": "0",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": "0",
    "is_pendant": "0",
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": null,
    "calculate_rate": 0.9166,
    "is_three_stone": "0",
    "company_info_id": 1
  },
  {
    "id": 1,
    "name": 9,
    "slug": "9K",
    "is_band": "0",
    "id_image": null,
    "id_metal": 1,
    "is_active": "1",
    "is_config": "0",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": "0",
    "is_pendant": "0",
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": null,
    "calculate_rate": 0.375,
    "is_three_stone": "0",
    "company_info_id": 1
  },
  {
    "id": 2,
    "name": 10,
    "slug": "10K",
    "is_band": "0",
    "id_image": null,
    "id_metal": 1,
    "is_active": "1",
    "is_config": "0",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": "0",
    "is_pendant": "0",
    "is_bracelet": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": "2025-04-28T06:11:00.57+00:00",
    "calculate_rate": 0.41659999999999997,
    "is_three_stone": "0",
    "company_info_id": 1
  },
  {
    "id": 3,
    "name": 14,
    "slug": "14K",
    "is_band": "1",
    "id_image": null,
    "id_metal": 1,
    "is_active": "1",
    "is_config": "1",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": "0",
    "is_pendant": "0",
    "is_bracelet": "1",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": null,
    "calculate_rate": 0.5832999999999999,
    "is_three_stone": "1",
    "company_info_id": 1
  },
  {
    "id": 4,
    "name": 18,
    "slug": "18K",
    "is_band": "1",
    "id_image": null,
    "id_metal": 1,
    "is_active": "1",
    "is_config": "1",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": "0",
    "is_pendant": "0",
    "is_bracelet": "1",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": null,
    "calculate_rate": 0.75,
    "is_three_stone": "1",
    "company_info_id": 1
  }
])
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
