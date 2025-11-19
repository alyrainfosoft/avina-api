'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const value = await queryInterface.sequelize.query(`SELECT * FROM clarities`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('clarities', [
          {
            "id": 1,
            "name": "SI",
            "slug": "si",
            "value": "SI",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-28T06:12:39.089+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 2,
            "name": "VS",
            "slug": "vs",
            "value": "VS",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-28T07:34:28.777+00:00",
            "modified_date": null,
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
