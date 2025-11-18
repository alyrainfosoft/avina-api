'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const value = await queryInterface.sequelize.query(`SELECT * FROM cuts`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('cuts', [
          {
            "id": 1,
            "slug": "good",
            "value": "Good",
            "is_band": null,
            "is_active": "1",
            "is_config": null,
            "created_by": 1,
            "is_deleted": "0",
            "is_earring": null,
            "is_pendant": null,
            "is_bracelet": null,
            "modified_by": null,
            "created_date": "2025-04-28T06:12:47.907+00:00",
            "modified_date": null,
            "is_three_stone": null,
            "company_info_id": 1
          },
          {
            "id": 2,
            "slug": "better",
            "value": "Better",
            "is_band": null,
            "is_active": "1",
            "is_config": null,
            "created_by": 1,
            "is_deleted": "0",
            "is_earring": null,
            "is_pendant": null,
            "is_bracelet": null,
            "modified_by": null,
            "created_date": "2025-04-28T07:13:13.84+00:00",
            "modified_date": null,
            "is_three_stone": null,
            "company_info_id": 1
          },
          {
            "id": 3,
            "slug": "best",
            "value": "Best",
            "is_band": "1",
            "is_active": "1",
            "is_config": "1",
            "created_by": 1,
            "is_deleted": "0",
            "is_earring": null,
            "is_pendant": null,
            "is_bracelet": "1",
            "modified_by": null,
            "created_date": "2025-04-28T07:13:17.731+00:00",
            "modified_date": null,
            "is_three_stone": "1",
            "company_info_id": 1
          }
        ]
      );
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
