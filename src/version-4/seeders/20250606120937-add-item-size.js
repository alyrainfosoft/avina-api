'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const value = await queryInterface.sequelize.query(`SELECT * FROM items_sizes`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('items_sizes', [
          {
            "id": 1,
            "size": "52.5 Mm",
            "slug": "52.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 2,
            "size": "55 Mm",
            "slug": "55",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:27.87+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 3,
            "size": "56.6 Mm",
            "slug": "56.6",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:31.15+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 5,
            "size": "57.19 Mm",
            "slug": "57.19",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:38.071+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 6,
            "size": "58.1 Mm",
            "slug": "58.1",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:41.712+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 7,
            "size": "59.45 Mm",
            "slug": "59.45",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:44.991+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 8,
            "size": "60.7 Mm",
            "slug": "60.7",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 10,
            "size": "61 Mm",
            "slug": "61",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 11,
            "size": "63.52 Mm",
            "slug": "63.52",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 12,
            "size": "7 In",
            "slug": "7 In",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 13,
            "size": "7 Inch",
            "slug": "7 Inch",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 14,
            "size": "75 X 54 Mm",
            "slug": "75 X 54 ",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 16,
            "size": "Us-10",
            "slug": "Us-10",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 17,
            "size": "Us-10.25",
            "slug": "Us-10.25",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 18,
            "size": "Us-10.5",
            "slug": "Us-10.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 19,
            "size": "Us-3",
            "slug": "Us-3",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 20,
            "size": "Us-3.75",
            "slug": "Us-3.75",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 21,
            "size": "Us-4",
            "slug": "Us-4",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 22,
            "size": "Us-4.25",
            "slug": "Us-4.25",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 23,
            "size": "Us-4.5",
            "slug": "Us-4.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 24,
            "size": "Us-4.75",
            "slug": "Us-4.75",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 25,
            "size": "Us-5",
            "slug": "Us-5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 26,
            "size": "Us-5.25",
            "slug": "Us-5.25",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 27,
            "size": "Us-5.5",
            "slug": "Us-5.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 28,
            "size": "Us-5.75",
            "slug": "Us-5.75",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 29,
            "size": "Us-6",
            "slug": "Us-6",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 30,
            "size": "Us-6.25",
            "slug": "Us-6.25",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 31,
            "size": "Us-6.5",
            "slug": "Us-6.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 32,
            "size": "Us-6.75",
            "slug": "Us-6.75",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 33,
            "size": "Us-7.25",
            "slug": "Us-7.25",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 34,
            "size": "Us-7.5",
            "slug": "Us-7.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 35,
            "size": "Us-7.75",
            "slug": "Us-7.75",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 36,
            "size": "Us-8",
            "slug": "Us-8",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 37,
            "size": "Us-8.5",
            "slug": "Us-8.5",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 38,
            "size": "Us-9",
            "slug": "Us-9",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 39,
            "size": "Us-9.75",
            "slug": "Us-9.75",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": null,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": null,
            "company_info_id": 1
          },
          {
            "id": 15,
            "size": "Us-7",
            "slug": "us-7",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": 1,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": "2025-04-28T10:26:01.882+00:00",
            "company_info_id": 1
          },
          {
            "id": 9,
            "size": "60 X 50",
            "slug": "60-x-50",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": 1,
            "created_date": "2025-04-27T13:18:24.066+00:00",
            "modified_date": "2025-04-29T12:15:49.862+00:00",
            "company_info_id": 1
          },
          {
            "id": 4,
            "size": "56 X 48",
            "slug": "56-x-48",
            "is_active": "1",
            "created_by": 1,
            "is_deleted": "0",
            "modified_by": 1,
            "created_date": "2025-04-27T13:18:34.431+00:00",
            "modified_date": "2025-04-29T12:16:14.566+00:00",
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
