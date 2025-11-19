'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
        const value = await queryInterface.sequelize.query(`SELECT * FROM colors`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('colors', [
          {
            "id": 1,
            "name": "GH",
            "slug": "gh",
            "value": "GH",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": 1,
            "created_date": "2025-04-28T06:12:34.123+00:00",
            "modified_date": "2025-04-28T07:34:14.125+00:00",
            "company_info_id": 1
          },
          {
            "id": 2,
            "name": "FG",
            "slug": "fg",
            "value": "FG",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": 1,
            "created_date": "2025-04-28T07:34:21.886+00:00",
            "modified_date": "2025-05-03T09:09:05.371+00:00",
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
