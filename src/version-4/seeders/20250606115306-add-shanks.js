'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
        const value = await queryInterface.sequelize.query(`SELECT * FROM shanks`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('shanks', [
  {
    "id": 1,
    "name": "Plain",
    "slug": "plain",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "PL",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T06:14:05.135+00:00",
    "modified_date": "2025-05-03T08:08:02.541+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "side_setting_id": null
  },
  {
    "id": 2,
    "name": "Twisted",
    "slug": "twisted",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "twisted",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:17:55.464+00:00",
    "modified_date": "2025-05-03T08:08:13.61+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "side_setting_id": null
  },
  {
    "id": 3,
    "name": "Cathedral",
    "slug": "cathedral",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "Cathedral",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:18:08.613+00:00",
    "modified_date": "2025-05-03T08:08:21.601+00:00",
    "is_three_stone": "1",
    "company_info_id": 1,
    "side_setting_id": null
  },
  {
    "id": 4,
    "name": "Knife Edge",
    "slug": "knife-edge",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "knifeedge",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:18:33.719+00:00",
    "modified_date": "2025-05-03T08:08:26.911+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "side_setting_id": null
  },
  {
    "id": 5,
    "name": "Split",
    "slug": "split",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "split",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:18:47.049+00:00",
    "modified_date": "2025-05-03T08:08:33.248+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "side_setting_id": null
  },
  {
    "id": 6,
    "name": "Wide Plain",
    "slug": "wide-plain",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "wide-plain",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:19:06.989+00:00",
    "modified_date": "2025-05-03T08:08:40.143+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "side_setting_id": null
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
