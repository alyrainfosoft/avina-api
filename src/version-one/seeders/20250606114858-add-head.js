'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
        const value = await queryInterface.sequelize.query(`SELECT * FROM carat_sizes`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('carat_sizes', [
  {
    "id": 6,
    "name": "Hidden Halo",
    "slug": "hidden-halo",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "hiddenhalo",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:16:24.031+00:00",
    "modified_date": "2025-05-03T08:06:59.691+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
  },
  {
    "id": 5,
    "name": "Single Halo",
    "slug": "single-halo",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "singlehalo",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:16:10.661+00:00",
    "modified_date": "2025-05-03T08:07:12.208+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
  },
  {
    "id": 4,
    "name": "Double halo",
    "slug": "double-halo",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "doublehalo",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:15:55.701+00:00",
    "modified_date": "2025-05-03T08:07:19.561+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
  },
  {
    "id": 3,
    "name": "Bezel",
    "slug": "bezel",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "bezel",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:15:39.476+00:00",
    "modified_date": "2025-05-03T08:07:30.945+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
  },
  {
    "id": 2,
    "name": "6Pr",
    "slug": "6pr",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "6Pr",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:15:15.78+00:00",
    "modified_date": "2025-05-03T08:07:38.587+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
  },
  {
    "id": 1,
    "name": "4Pr",
    "slug": "4pr",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": "1",
    "sort_code": "4PR",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T06:13:42.372+00:00",
    "modified_date": "2025-05-03T08:07:44.732+00:00",
    "is_three_stone": null,
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
  },
  {
    "id": 7,
    "name": "3 Stone",
    "slug": "3-stone",
    "is_band": null,
    "id_image": null,
    "is_active": "1",
    "is_config": null,
    "sort_code": "3Stone",
    "created_by": 1,
    "is_deleted": "0",
    "is_earring": null,
    "is_pendant": null,
    "sort_order": null,
    "is_bracelet": null,
    "modified_by": 1,
    "created_date": "2025-04-28T07:16:52.724+00:00",
    "modified_date": "2025-05-03T08:06:52.734+00:00",
    "is_three_stone": "1",
    "company_info_id": 1,
    "diamond_size_id": null,
    "diamond_shape_id": null
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
